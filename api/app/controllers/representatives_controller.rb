require 'net/http'
require 'json'
require 'uri'

class RepresentativesController < ApplicationController
  LEGISLATORS_URL = 'https://unitedstates.github.io/congress-legislators/legislators-current.json'

  # FIPS code to state abbreviation mapping
  FIPS_TO_STATE = {
    '01' => 'AL', '02' => 'AK', '04' => 'AZ', '05' => 'AR', '06' => 'CA',
    '08' => 'CO', '09' => 'CT', '10' => 'DE', '11' => 'DC', '12' => 'FL',
    '13' => 'GA', '15' => 'HI', '16' => 'ID', '17' => 'IL', '18' => 'IN',
    '19' => 'IA', '20' => 'KS', '21' => 'KY', '22' => 'LA', '23' => 'ME',
    '24' => 'MD', '25' => 'MA', '26' => 'MI', '27' => 'MN', '28' => 'MS',
    '29' => 'MO', '30' => 'MT', '31' => 'NE', '32' => 'NV', '33' => 'NH',
    '34' => 'NJ', '35' => 'NM', '36' => 'NY', '37' => 'NC', '38' => 'ND',
    '39' => 'OH', '40' => 'OK', '41' => 'OR', '42' => 'PA', '44' => 'RI',
    '45' => 'SC', '46' => 'SD', '47' => 'TN', '48' => 'TX', '49' => 'UT',
    '50' => 'VT', '51' => 'VA', '53' => 'WA', '54' => 'WV', '55' => 'WI',
    '56' => 'WY'
  }

  # Hardcoded ZIP to congressional district lookup for Illinois (prototype)
  IL_ZIP_TO_DISTRICT = {
    '60601' => 7, '60602' => 7, '60603' => 7, '60604' => 7, '60605' => 7, '60606' => 7, '60607' => 7,
    '60608' => 7, '60609' => 7, '60610' => 7, '60611' => 7, '60612' => 7, '60613' => 7, '60615' => 7,
    '60616' => 7, '60617' => 7, '60619' => 7, '60620' => 7, '60621' => 7, '60622' => 4, '60623' => 7,
    '60624' => 7, '60625' => 5, '60626' => 7, '60628' => 7, '60629' => 7, '60630' => 5, '60631' => 7,
    '60632' => 7, '60633' => 7, '60634' => 7, '60636' => 7, '60637' => 7, '60638' => 7, '60639' => 7,
    '60640' => 5, '60641' => 7, '60642' => 7, '60643' => 7, '60644' => 7, '60645' => 7, '60646' => 7,
    '60647' => 7, '60649' => 7, '60651' => 7, '60652' => 7, '60653' => 7, '60654' => 7, '60655' => 7,
    '60656' => 7, '60657' => 5, '60659' => 7, '60660' => 5, '60661' => 7, '60614' => 5, '60618' => 5
  }

  # ZIP prefix to state mapping (first 3 digits)
  ZIP_TO_STATE = {
    '606' => 'IL', '60' => 'IL'
  }

  def index
    zip_code = params[:zip]
    street = params[:street]

    if zip_code.blank? || zip_code.length != 5
      render json: { error: 'Invalid ZIP code' }, status: :bad_request
      return
    end

    begin
      # If street is provided, use Census geocoder; otherwise fall back to hardcoded lookup
      if street.present?
        district_info = fetch_district_from_census(zip_code, street)

        unless district_info
          render json: { error: 'Could not find district for this address' }, status: :not_found
          return
        end

        has_specific_district = true
      else
        # Get state from ZIP prefix
        state = ZIP_TO_STATE[zip_code[0..2]] || ZIP_TO_STATE[zip_code[0..1]]

        unless state
          render json: { error: 'Invalid ZIP code or state not found' }, status: :not_found
          return
        end

        # Get district from lookup table (IL only for now)
        district = IL_ZIP_TO_DISTRICT[zip_code]
        has_specific_district = !district.nil?

        district_info = { state: state, district: district }
      end

      Rails.logger.info "=== ZIP #{zip_code} Lookup ==="
      Rails.logger.info "street: #{street.inspect}"
      Rails.logger.info "district_info: #{district_info.inspect}"

      # Fetch legislators
      legislators = fetch_legislators

      # Track seen bioguide_ids to deduplicate
      seen_bioguide_ids = Set.new
      senators = []
      house_reps = []

      legislators.each do |legislator|
        bioguide_id = legislator.dig('id', 'bioguide')
        next if seen_bioguide_ids.include?(bioguide_id)

        current_term = legislator['terms']&.last
        next unless current_term && current_term['state'] == district_info[:state]

        is_senator = current_term['type'] == 'sen'

        # For House reps, only include the one matching the district (if we have a district)
        if !is_senator && has_specific_district
          Rails.logger.info "Checking House rep: #{legislator.dig('name', 'official_full')}"
          Rails.logger.info "  current_term['district']: #{current_term['district'].inspect} (#{current_term['district'].class})"
          Rails.logger.info "  district_info[:district]: #{district_info[:district].inspect} (#{district_info[:district].class})"

          if current_term['district'].to_i != district_info[:district].to_i
            Rails.logger.info "  SKIPPING - district mismatch"
            next
          end
        end

        office = if is_senator
          "U.S. Senator from #{district_info[:state]}"
        else
          "U.S. Representative, #{district_info[:state]}-#{current_term['district']}"
        end

        party_name = case current_term['party']
                     when 'Democrat' then 'Democratic'
                     when 'Republican' then 'Republican'
                     else current_term['party']
                     end

        rep = {
          name: legislator.dig('name', 'official_full'),
          office: office,
          party: party_name,
          phones: current_term['phone'] ? [current_term['phone']] : nil,
          urls: current_term['url'] ? [current_term['url']] : nil,
          address: current_term['address'] ? [current_term['address']] : nil
        }

        seen_bioguide_ids.add(bioguide_id)

        if is_senator
          senators << rep if senators.length < 2
        else
          house_reps << rep if house_reps.length < 1
        end
      end

      render json: {
        senators: senators.take(2),
        houseReps: house_reps.take(1),
        state: district_info[:state],
        hasSpecificDistrict: has_specific_district
      }
    rescue => e
      Rails.logger.error "Error fetching representatives: #{e.message}"
      render json: { error: 'Failed to fetch representatives' }, status: :internal_server_error
    end
  end

  private

  def fetch_district_from_census(zip_code, street = nil)
    # Choose endpoint based on whether street is provided
    if street.present?
      base_url = 'https://geocoding.geo.census.gov/geocoder/geographies/address'
      uri = URI("#{base_url}?street=#{CGI.escape(street)}&zip=#{zip_code}&benchmark=Public_AR_Current&vintage=Current_Current&layers=54&format=json")
    else
      base_url = 'https://geocoding.geo.census.gov/geocoder/geographies/zipcode'
      uri = URI("#{base_url}?zip=#{zip_code}&benchmark=Public_AR_Current&vintage=Current_Current&layers=54&format=json")
    end

    Rails.logger.info "=== Census API Request ==="
    Rails.logger.info "URL: #{uri}"

    # Use Net::HTTP with SSL verification disabled for development
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)

    Rails.logger.info "Response code: #{response.code}"

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error "Census API returned non-success status: #{response.code}"
      Rails.logger.error "Response body: #{response.body}"
      return nil
    end

    data = JSON.parse(response.body)
    Rails.logger.info "=== Full Census API Response ==="
    Rails.logger.info JSON.pretty_generate(data)

    # For address endpoint, use addressMatches; for zipcode endpoint, check result directly
    if street.present?
      address_matches = data.dig('result', 'addressMatches')

      if address_matches.nil? || address_matches.empty?
        Rails.logger.warn "No address matches found in Census response"
        return nil
      end

      match = address_matches.first
      geographies = match['geographies']
    else
      geographies = data.dig('result', 'geographies')
    end

    if geographies.nil?
      Rails.logger.warn "No geographies found in Census response"
      return nil
    end

    # Find any key matching "Congressional Districts" (case-insensitive)
    district_key = geographies.keys.find { |k| k =~ /Congressional Districts/i }

    if district_key.nil?
      Rails.logger.warn "No congressional districts found in Census response"
      Rails.logger.warn "Available geographies: #{geographies.keys.inspect}"
      return nil
    end

    Rails.logger.info "Found district key: #{district_key}"
    districts = geographies[district_key]

    if districts.nil? || districts.empty?
      Rails.logger.warn "Districts array is empty"
      return nil
    end

    district = districts.first
    Rails.logger.info "District data: #{district.inspect}"

    # Extract district number - try DISTRICT, GEOID, or BASENAME
    district_num = district['DISTRICT']&.to_i
    if district_num.nil? || district_num.zero?
      # Try GEOID (format: SSDD where SS=state, DD=district)
      geoid = district['GEOID']
      district_num = geoid[-2..-1].to_i if geoid
    end
    if district_num.nil? || district_num.zero?
      # Try BASENAME (format: "Congressional District X")
      basename = district['BASENAME']
      district_num = basename.scan(/\d+/).first.to_i if basename
    end

    state_fips = district['STATE']

    if district_num.nil? || district_num.zero? || state_fips.nil?
      Rails.logger.warn "Invalid district data: district=#{district_num}, state=#{state_fips}"
      return nil
    end

    # Convert FIPS code to state abbreviation
    state_code = FIPS_TO_STATE[state_fips]

    if state_code.nil?
      Rails.logger.warn "Unknown FIPS code: #{state_fips}"
      return nil
    end

    Rails.logger.info "Successfully parsed: state=#{state_code} (FIPS: #{state_fips}), district=#{district_num}"
    { state: state_code, district: district_num }
  rescue => e
    Rails.logger.error "Error fetching district from Census: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    nil
  end

  def fetch_legislators
    uri = URI(LEGISLATORS_URL)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)

    raise 'Failed to fetch legislators' unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end
end

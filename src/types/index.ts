export interface Representative {
  name: string;
  office: string;
  party?: string;
  photoUrl?: string;
  phones?: string[];
  urls?: string[];
  emails?: string[];
  address?: string[];
  channels?: {
    type: string;
    id: string;
  }[];
  bioguideId?: string;
  firstTermStart?: string;
}

export interface CivicInfoResponse {
  normalizedInput?: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  offices?: {
    name: string;
    divisionId: string;
    levels?: string[];
    roles?: string[];
    officialIndices: number[];
  }[];
  officials?: {
    name: string;
    party?: string;
    phones?: string[];
    urls?: string[];
    photoUrl?: string;
    emails?: string[];
    address?: {
      line1?: string;
      line2?: string;
      line3?: string;
      city?: string;
      state?: string;
      zip?: string;
    }[];
    channels?: {
      type: string;
      id: string;
    }[];
  }[];
}

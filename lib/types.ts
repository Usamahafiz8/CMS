// The safe subset of User returned wherever an API includes "who created
// this" / "who sent this" — never the full row (never the password hash).
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

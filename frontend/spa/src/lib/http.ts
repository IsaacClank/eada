export interface HttpClientOptions {
  baseAddress: string;
  bearerToken?: string | null;
}

export class HttpClient {
  private static ContentType_ApplicationJson: [string, string] = [
    "Content-Type",
    "application/json",
  ];

  private _baseAddress: string;
  private _bearerToken: string | null;

  constructor({ baseAddress, bearerToken }: HttpClientOptions) {
    this._baseAddress = baseAddress.endsWith("/") ? baseAddress.slice(0, -1) : baseAddress;
    this._bearerToken = bearerToken ?? null;
  }

  get baseAddress() {
    return this._baseAddress;
  }
  set baseAddress(value: string) {
    this._baseAddress = value;
  }

  get bearerToken() {
    return this._bearerToken;
  }
  set bearerToken(value: string | null) {
    this._bearerToken = value;
  }

  async getJsonAsync(path: string): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`, {
      headers: this._defaultHeaders(),
    });
  }

  async postJsonAsync(path: string, body: unknown): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: this._defaultHeaders().concat([HttpClient.ContentType_ApplicationJson]),
    });
  }

  async putJsonAsync(path: string, body: unknown): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: this._defaultHeaders().concat([HttpClient.ContentType_ApplicationJson]),
    });
  }

  _defaultHeaders(): [string, string][] {
    return this._bearerToken ? [["Authorization", `Bearer ${this._bearerToken}`]] : [];
  }
}

export class HttpClientFactory {
  private _httpClient: HttpClient = new HttpClient({
    baseAddress: "",
  });

  get httpClient() {
    return this._httpClient;
  }

  baseAddress(address: string): HttpClientFactory {
    this._httpClient.baseAddress = address;
    return this;
  }

  token(token?: string | null) {
    this._httpClient.bearerToken = token ?? null;
    return this;
  }
}

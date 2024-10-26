export interface HttpClientOptions {
  baseAddress: string;
}

export class HttpClient {
  _baseAddress: string;

  constructor({ baseAddress }: HttpClientOptions) {
    this._baseAddress = baseAddress.endsWith("/") ? baseAddress.slice(0, -1) : baseAddress;
  }

  async getJsonAsync(path: string): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`);
  }

  async postJsonAsync(path: string, body: unknown): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: [ContentType_ApplicationJson],
    });
  }

  async putJsonAsync(path: string, body: unknown): Promise<Response> {
    return fetch(`${this._baseAddress}/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: [ContentType_ApplicationJson],
    });
  }
}

const ContentType_ApplicationJson: [string, string] = ["Content-Type", "application/json"];

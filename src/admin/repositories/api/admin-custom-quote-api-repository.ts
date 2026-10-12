import { HbsApiClient, HbsApiError } from "@/api";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";
import type { AdminCustomQuote, AdminCustomQuoteOpening } from "@/admin/types/admin.types";
import type {
  AdminCustomQuoteListParams,
  AdminCustomQuoteRepository,
  PaginatedAdminCustomQuotes,
} from "@/admin/repositories/interfaces";

type ApiQuote = {
  id: string;
  reference: string;
  requestType: AdminCustomQuote["requestType"];
  professionalDetails?: AdminCustomQuote["professionalDetails"];
  productType: AdminCustomQuote["productType"];
  openings: AdminCustomQuoteOpening[];
  preferences: AdminCustomQuote["preferences"];
  contact: AdminCustomQuote["contact"];
  attachmentMetadata: AdminCustomQuote["attachmentMetadata"];
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
  emailSentAt: string | null;
  customerId: string | null;
  convertedAt: string | null;
  convertedBy: string | null;
};
type ApiQuoteList = {
  items: ApiQuote[];
  total: number;
  unread: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
type ApiConversionResponse = {
  quote: ApiQuote;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    governorate: string;
    preferredChannel: AdminCustomQuote["contact"]["preferredContact"] | null;
  };
  action: "created" | "associated" | "already_associated";
};

async function accessToken(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token)
    throw new HbsApiError(401, "Session Admin expirée. Veuillez vous reconnecter.");
  return data.session.access_token;
}

function mapQuote(quote: ApiQuote): AdminCustomQuote {
  const { professionalDetails, ...base } = quote;
  return professionalDetails ? { ...base, professionalDetails } : base;
}

export class ApiAdminCustomQuoteRepository implements AdminCustomQuoteRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  private async request<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return fn(await accessToken());
  }

  async list(params: AdminCustomQuoteListParams): Promise<PaginatedAdminCustomQuotes> {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.query?.trim()) query.set("q", params.query.trim());
    if (params.unreadOnly !== undefined) query.set("unreadOnly", String(params.unreadOnly));
    if (params.includeArchived !== undefined)
      query.set("includeArchived", String(params.includeArchived));
    if (params.requestType) query.set("requestType", params.requestType);
    const response = await this.request((token) =>
      this.client.get<ApiQuoteList>(`/api/v1/admin/custom-quotes?${query}`, undefined, token),
    );
    return { ...response, items: response.items.map(mapQuote) };
  }

  async getById(id: string): Promise<AdminCustomQuote | null> {
    try {
      return mapQuote(
        await this.request((token) =>
          this.client.get<ApiQuote>(
            `/api/v1/admin/custom-quotes/${encodeURIComponent(id)}`,
            undefined,
            token,
          ),
        ),
      );
    } catch (error) {
      if (error instanceof HbsApiError && error.status === 404) return null;
      throw error;
    }
  }

  async markRead(id: string): Promise<AdminCustomQuote> {
    return mapQuote(
      await this.request((token) =>
        this.client.patch<ApiQuote>(
          `/api/v1/admin/custom-quotes/${encodeURIComponent(id)}/read`,
          {},
          token,
        ),
      ),
    );
  }

  async archive(id: string): Promise<AdminCustomQuote> {
    return mapQuote(
      await this.request((token) =>
        this.client.patch<ApiQuote>(
          `/api/v1/admin/custom-quotes/${encodeURIComponent(id)}/archive`,
          {},
          token,
        ),
      ),
    );
  }

  async convertToCustomer(id: string): Promise<AdminCustomQuote> {
    const response = await this.request((token) =>
      this.client.post<ApiConversionResponse>(
        `/api/v1/admin/custom-quotes/${encodeURIComponent(id)}/convert-to-customer`,
        {},
        token,
      ),
    );
    return mapQuote(response.quote);
  }
}

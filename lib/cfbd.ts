const BASE_URL = "https://apinext.collegefootballdata.com";

async function cfbdFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = process.env.CFBD_API_KEY;
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`CFBD API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export interface CFBTeam {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  color: string;
  alt_color: string;
  logos: string[];
}

export interface CFBPlayer {
  id: number;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  height: number;
  weight: number;
  jersey: number;
  year: number;
}

export async function getTeams(conference?: string): Promise<CFBTeam[]> {
  const params: Record<string, string> = { division: "fbs" };
  if (conference) params.conference = conference;
  return cfbdFetch<CFBTeam[]>("/teams", params);
}

export async function getPlayersByTeam(team: string, year: number): Promise<CFBPlayer[]> {
  return cfbdFetch<CFBPlayer[]>("/roster", { team, year: String(year) });
}

export async function getConferences(): Promise<{ id: number; name: string; short_name: string }[]> {
  return cfbdFetch("/conferences");
}

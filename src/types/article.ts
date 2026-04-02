export interface Perspective {
  id: string;
  label: string;
  icon: string;
  tone: string;
  content: string[];
  keyArguments: string[];
}

export interface ArticleFeed {
  id: string;
  title: string;
  body: string;
  tags: string[];
  access_level: "free" | "micropay" | "premium";
  published_at: string | null;
  created_at: string;
  journalist_id: string;
  journalist_name: string | null;
  read_time: number;
  perspectives: Perspective[] | null;
}

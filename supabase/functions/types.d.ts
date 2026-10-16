
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  [key: string]: any;
};

declare module "npm:openai@^4.68.0" {
  import OpenAI from "openai";
  export default OpenAI;
  export * from "openai";
}

declare module "npm:@supabase/supabase-js@^2.45.6" {
  export * from "@supabase/supabase-js";
}

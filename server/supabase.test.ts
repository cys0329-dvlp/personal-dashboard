import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Connection", () => {
  it("should connect to Supabase successfully", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    // 간단한 테스트: auth 상태 확인
    const { data, error } = await supabase.auth.getSession();

    // 에러가 없으면 연결 성공
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

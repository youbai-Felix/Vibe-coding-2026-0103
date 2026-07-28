export interface PushParams {
  title: string;
  author: string;
  digest: string;
  content: string;
  apiUrl: string;
}

export async function pushToDraft(params: PushParams): Promise<{ success: boolean; message: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(params.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: params.title,
        author: params.author,
        digest: params.digest,
        content: params.content,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (data.error) {
      return { success: false, message: data.error };
    }
    return { success: true, message: "推送成功！请到公众号后台查看草稿箱。" };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      return { success: false, message: "请求超时（30秒），请检查网络或 API 地址。" };
    }
    return { success: false, message: `推送失败：${err.message}` };
  }
}

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // 오직 POST 요청만 받음
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { prompt } = await req.json();
        
        // Vercel 환경변수에서 키를 가져옴
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API Key가 설정되지 않았습니다.' }), { status: 500 });
        }

        // 구글 Gemini API 호출
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const data = await response.json();

        // 에러 처리
        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.error?.message || 'API Error' }), { status: 500 });
        }

        // 결과 텍스트 추출
        const text = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({ result: text }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

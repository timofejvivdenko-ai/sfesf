export default async function handler(req, res) {
    // Налаштування для сайту, щоб він міг звертатися до сервера
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { code } = req.body; // Беремо тільки текст коду
    const token = process.env.MY_TOKEN; 
    const owner = 'timofejvivdenko-ai';
    const repo = 'sfesf';
    const path = 'textlol.txt';

    try {
        // 1. Отримуємо SHA файлу (це потрібно GitHub, щоб дозволити оновлення)
        const getFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { "Authorization": `token ${token}` }
        });
        const fileData = await getFile.json();

        // 2. Відправляємо оновлений текст
        const update = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { 
                "Authorization": `token ${token}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                message: "Update via Vercel",
                content: Buffer.from(code).toString('base64'),
                sha: fileData.sha
            })
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

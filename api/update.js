export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { code, fileName = "textlol.txt", logUpdate = false, nick = "Unknown" } = req.body;
    const token = process.env.MY_TOKEN; // Токен береться з налаштувань Vercel
    const owner = 'timofejvivdenko-ai';
    const repo = 'sfesf';

    try {
        // Отримуємо SHA файлу
        const getFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
            headers: { "Authorization": `token ${token}` }
        });
        const fileData = await getFile.json();

        // Оновлюємо файл
        await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`, {
            method: 'PUT',
            headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Update",
                content: Buffer.from(code).toString('base64'),
                sha: fileData.sha
            })
        });

        // Якщо це запуск - оновлюємо ЛОГ (для лічильника)
        if (logUpdate) {
            const getLog = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/uptadeLOG`, {
                headers: { "Authorization": `token ${token}` }
            });
            const logData = await getLog.json();
            const currentLog = Buffer.from(logData.content, 'base64').toString();
            const newLog = currentLog + `\n[EXEC] ${nick} | ${new Date().toLocaleString()}`;

            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/uptadeLOG`, {
                method: 'PUT',
                headers: { "Authorization": `token ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Log Update",
                    content: Buffer.from(newLog).toString('base64'),
                    sha: logData.sha
                })
            });
        }

        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

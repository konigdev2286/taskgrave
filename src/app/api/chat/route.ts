import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const { messages } = await req.json();
    const lastMessage = (messages[messages.length - 1].text || "").toLowerCase();

    // SIMPLE LOCAL FALLBACK (FREE & INSTANT)
    if (lastMessage.includes("prix") || lastMessage.includes("tarif") || lastMessage.includes("coûte")) {
      return NextResponse.json({ text: "Nos tarifs Pros commencent à 30 000 FCFA/mois (Pack Starter). Pour les particuliers, le prix dépend de la course. Consultez la page 'Tarifs' pour plus de détails." });
    }
    if (lastMessage.includes("suivi") || lastMessage.includes("où est") || lastMessage.includes("commande")) {
      return NextResponse.json({ text: "Vous pouvez suivre votre colis en temps réel dans la rubrique 'Suivi' de votre espace client." });
    }
    if (lastMessage.includes("gaz")) {
      return NextResponse.json({ text: "Nous livrons toutes les bouteilles de gaz à domicile. Payez simplement à la livraison !" });
    }

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // We keep flash but the logic below is more robust
    });

    const systemPrompt = `Tu es l'assistant de J'ARRIVE, logistique au Congo. Pro, poli, court. Gaz, colis, déménagement. Cash à la livraison. +242 06 621 73 95.`;

    const history: any[] = [
      { role: 'user', parts: [{ text: "Bonjour. Identité: " + systemPrompt + ". Réponds OK." }] },
      { role: 'model', parts: [{ text: "OK." }] }
    ];

    let nextRole = 'user';
    for (let i = 0; i < messages.length - 1; i++) {
        const geminiRole = messages[i].role === 'bot' ? 'model' : 'user';
        if (geminiRole === nextRole) {
            history.push({ role: geminiRole, parts: [{ text: messages[i].text }] });
            nextRole = geminiRole === 'user' ? 'model' : 'user';
        }
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(messages[messages.length - 1].text);
    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    console.error('[ChatAPI] Gemini error:', error.message || error);
    return NextResponse.json({ 
      error: 'Erreur technique',
      details: error.message 
    }, { status: 500 });
  }
}

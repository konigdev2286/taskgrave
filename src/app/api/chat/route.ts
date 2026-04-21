import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const { messages } = await req.json();
    console.log('Chat messages received:', messages.length);

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `Tu es l'assistant de J'ARRIVE, une plateforme de logistique et de livraison au Congo-Brazzaville. Professionnel, poli, concis.
Services : livraison colis/repas, gaz, déménagement, stockage.
Paiement : Cash ou MoMo à la livraison (ou via portefeuille client si approvisionné). 
Abonnements Pro : Starter (30k/25 courses), Standard (80k/80 courses), Pro (200k/250 courses).
Assistance : +242 06 621 73 95.
Réponds en moins de 3 phrases. Si on demande "où est ma commande", renvoie vers la rubrique "Suivi".`,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    // Valid history for Gemini: must start with 'user' and alternate 'user'/'model'
    const history: any[] = [];
    let nextRole = 'user';

    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      const geminiRole = msg.role === 'bot' ? 'model' : 'user';
      
      if (geminiRole === nextRole) {
        history.push({
          role: geminiRole,
          parts: [{ text: msg.text || "" }]
        });
        nextRole = geminiRole === 'user' ? 'model' : 'user';
      }
    }
    
    console.log('[ChatAPI] Cleaned history length:', history.length);

    const lastMessage = messages[messages.length - 1].text;
    const chat = model.startChat({ history });
    
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();
    
    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('[ChatAPI] Gemini error:', error.message || error);
    return NextResponse.json({ 
      error: 'Erreur technique',
      details: error.message 
    }, { status: 500 });
  }
}

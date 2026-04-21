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

    const systemPrompt = `Tu es l'Expert Client J'ARRIVE Logistique (Congo). 
    Ton identité : Pro, réactif, chaleureux et expert de la logistique à Brazzaville et Pointe-Noire.
    
    Services clés :
    1. Livraison Colis : Express ou Standard.
    2. Gaz à domicile : Toutes marques (Total, Coraf, etc.). Recharge et achat.
    3. Déménagement : Formule complète (bras cassés, transport).
    4. E-commerce : Solutions pour les vendeurs locaux.
    
    Règles de vente :
    - Paiement : CASH à la livraison (sécurisant pour le client).
    - Tarifs : À partir de 1000 FCFA pour les petites courses. Pack Pro dès 30.000 FCFA/mois.
    - Contact : +242 06 621 73 95.
    
    Ton style : Réponses courtes, structurées. Utilise des emojis logistiques (📦, 🚚, ⛽). 
    Si on te demande ton identité, tu es l'assistant intelligent de J'ARRIVE.`;

    const history: any[] = [
      { role: 'user', parts: [{ text: "Bonjour. Voici tes instructions : " + systemPrompt + ". Confirme avec 'Prêt'." }] },
      { role: 'model', parts: [{ text: "Prêt ! 📦 Comment puis-je vous aider aujourd'hui avec J'ARRIVE ?" }] }
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
    console.error('[ChatAPI] Global Error:', error);
    
    // Extract more details if available (e.g. from Google SDK)
    const errorMessage = error.message || "Erreur inconnue";
    const status = error.status || 500;
    
    return NextResponse.json({ 
      error: 'Erreur technique AI',
      details: errorMessage,
      code: error.code || 'UNKNOWN'
    }, { status });
  }
}

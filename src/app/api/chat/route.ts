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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `Tu es l'Expert Client J'ARRIVE Logistique (Congo). 
    Ton identité : Professionnel, expert local, chaleureux.
    
    SERVICES & TARIFS :
    1. LIVRAISON (à la course) :
       - Centre Ville (CHU, Poto-poto, OCH, Plateau) : 1000 FCFA
       - Périphérie A (Ouenzé, Talangaï, Bacongo, Rond-point) : 1500 FCFA
       - Périphérie B (Mfilou, Nkombo, Madibou, Sadelmi) : 2000 - 2500 FCFA
       - Longue portée (Kintélé, Nganga Lingolo, Igné, Samba) : 3000 - 5000 FCFA
       
    2. GAZ À DOMICILE :
       - Achat et recharge de toutes marques (Total, Coraf, etc.). Livraison express.
       
    3. DÉMÉNAGEMENT :
       - Service complet : transport et manutention ("c'est nous qui le faisons"). Sur devis.
       
    4. STOCKAGE (par jour/semaine/mois) :
       - 0-5kg : 500 / 2500 / 5000 FCFA
       - 6-10kg : 1000 / 5000 / 10000 FCFA
       - 100kg+ : Sur devis.
    
    RÈGLES IMPORTANTES :
    - Paiement : CASH à la livraison uniquement.
    - Contact : +242 06 621 73 95.
    - Style : Répondre avec emojis (🚚, ⛽, 📦). Très court.`;

    const userMessage = messages[messages.length - 1].text.toLowerCase();

    // 1. Check Custom Knowledge Base (Manual "Coding")
    const { data: knowledge } = await supabase
      .from('bot_knowledge')
      .select('keywords, response');

    if (knowledge) {
      const match = knowledge.find(k => 
        k.keywords.some((kw: string) => userMessage.includes(kw.toLowerCase()))
      );
      if (match) {
        return NextResponse.json({ text: match.response });
      }
    }

    // 2. Fallback to Gemini AI if no manual match
    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const finalPrompt = `${systemPrompt}\n\nClient: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return NextResponse.json({ text: response.text() });
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

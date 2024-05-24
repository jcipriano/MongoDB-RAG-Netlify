import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { vectorStore } from '@/utils/openai';
import { NextResponse } from 'next/server';
import { BufferMemory } from "langchain/memory";


export async function POST(req: Request) {
    try {
        const { stream, handlers } = LangChainStream();
        const body = await req.json();
        const messages: Message[] = body.messages ?? [];
        const question = messages[messages.length - 1].content;

        console.log('Create OpenAI model');
        const model = new ChatOpenAI({
            temperature: 0.8,
            streaming: true,
            callbacks: [handlers],
        });

        console.log('Get vector retretriever');
        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", 
            "searchKwargs": { "fetchK": 10, "lambda": 0.25 } 
        })

        console.log('Retrieving conversation chain');
        const conversationChain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
            memory: new BufferMemory({
              memoryKey: "chat_history",
            }),
          })

        console.log('Invoke conversation chain');
        conversationChain.invoke({
            "question": question
        })

        console.log('Return stream');
        return new StreamingTextResponse(stream);
    }
    catch (e) {
        return NextResponse.json({ message: 'Error Processing' }, { status: 500 });
    }
}

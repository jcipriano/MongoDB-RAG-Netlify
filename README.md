
# RAG Based Chat-bot using Langchain and MongoDB Atlas
This starter template implements a Retrieval-Augmented Generation (RAG) chatbot using LangChain and MongoDB Atlas. RAG combines AI language generation with knowledge retrieval for more informative responses. LangChain simplifies building the chatbot logic, while MongoDB Atlas' Vector database capability provides a powerful platform for storing and searching the knowledge base that fuels the chatbot's responses.

## Setup 
### Prerequisites

Before you begin, make sure you have the following ready:

- **MongoDB Atlas URI**: Setup your account if you don't already have one ([Create Account](https://www.mongodb.com/docs/guides/atlas/account/))
    
- **OpenAI API Key** (https://platform.openai.com/api-keys)



## Steps to Deploy 
Follow the below-mentioned steps to deploy the app on Vercel.

#### Step 1: Click the below button to navigate to the Netlify deployment page
[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/utsavMongoDB/MongoDB_RAG_Netlify)

#### Step 2: Add Environment Variables

Populate the values of the ENV variables mentioned below

````
OPENAI_API_KEY = "<YOUR_OPENAI_KEY>"              # API Key copied from the OpenAI portal
MONGODB_URI = "<YOUR_MONGODB_URI>"                # Connection URI to MongoDB Instance
````

#### Step 3: Deploy
Once you have updated the above values, go ahead and click deploy to deploy the app. Wait for the app to be deployed and start serving traffic.


#### Step 4: Upload PDF files to create chunks
Head to the `Train` tab and upload a PDF document. 

If everything is deployed correctly, your document should start uploading to your cluster under the `chatter > training_data` collection.

Your data should now start appearing as below in the collection.

![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/4206044a-1c91-4836-b5c2-e300a7d7170e)



#### Step 5: Create Vector Index on Atlas
Now for the RAG (QnA) to work, you need to create a Vector Search Index on Atlas so the vector data can be fetched and served to LLMs.

Create a search index as below.

- Let’s head over to our MongoDB Atlas user interface to create our Vector Search Index. First, click on the “Search” tab and then on “Create Search Index.” You’ll be taken to this page (shown below). Please click on “JSON Editor.”
![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/d6b80235-3279-432e-a214-022568d4e3ce)

- Next input the values as shown in the below image and create the Vector.

  ````
    {
      "fields": [
        {
          "type": "vector",
          "path": "text_embedding",
          "numDimensions": 1536,
          "similarity": "cosine",
        }
      ]
    }
  ````

  ![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/ced53caa-5dcd-4b78-82f1-8f76650b0e9e)

- You should start seeing a vector index getting created. You should get an email once index creation is completed.
  ![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/ddc51613-f76e-4195-ae4d-5b4ae236a9da)

- Once completed, head to the QnA section to start asking questions based on your trained data, and you should get the desired response.

  ![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/254d9c74-ec9a-4497-9e0f-0aee30aa90a7)



## Reference Architechture 

![image](https://github.com/utsavMongoDB/MongoDB_RAG_Netlify/assets/114057324/a7622160-3b69-4121-a762-4bd97f9d46e6)


This architecture depicts a Retrieval-Augmented Generation (RAG) chatbot system built with LangChain, OpenAI, and MongoDB Atlas Vector Search. Let's break down its key players:

- **PDF File**: This serves as the knowledge base, containing the information the chatbot draws from to answer questions. The RAG system extracts and processes this data to fuel the chatbot's responses.
- **Text Chunks**: These are meticulously crafted segments extracted from the PDF. By dividing the document into smaller, targeted pieces, the system can efficiently search and retrieve the most relevant information for specific user queries.
- **LangChain**: This acts as the central control unit, coordinating the flow of information between the chatbot and the other components. It preprocesses user queries, selects the most appropriate text chunks based on relevance, and feeds them to OpenAI for response generation.
- **Query Prompt**: This signifies the user's question or input that the chatbot needs to respond to.
- **Actor**: This component acts as the trigger, initiating the retrieval and generation process based on the user query. It instructs LangChain and OpenAI to work together to retrieve relevant information and formulate a response.
- **OpenAI Embeddings**: OpenAI, a powerful large language model (LLM), takes centre stage in response generation. By processing the retrieved text chunks (potentially converted into numerical representations or embeddings), OpenAI crafts a response that aligns with the user's query and leverages the retrieved knowledge.
- **MongoDB Atlas Vector Store**: This specialized database is optimized for storing and searching vector embeddings. It efficiently retrieves the most relevant text chunks from the knowledge base based on the query prompt's embedding. These retrieved knowledge nuggets are then fed to OpenAI to inform its response generation.


This RAG-based architecture seamlessly integrates retrieval and generation. It retrieves the most relevant knowledge from the database and utilizes OpenAI's language processing capabilities to deliver informative and insightful answers to user queries.


## Implementation 

The below components are used to build up the bot, which can retrieve the required information from the vector store, feed it to the chain and stream responses to the client.

#### LLM Model 

        const model = new ChatOpenAI({
            temperature: 0.8,
            streaming: true,
            callbacks: [handlers],
        });


#### Vector Store

        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", 
            "searchKwargs": { "fetchK": 10, "lambda": 0.25 } 
        })

#### Chain

       const conversationChain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
            memory: new BufferMemory({
              memoryKey: "chat_history",
            }),
          })
        conversationChain.invoke({
            "question": question
        })

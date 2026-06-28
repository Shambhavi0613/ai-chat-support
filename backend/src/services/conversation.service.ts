const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaLibSql({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function getOrCreateConversation(sessionId?: string) {
  if (sessionId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });
    if (existing) return existing;
  }

  return await prisma.conversation.create({
    data: {},
    include: { messages: true },
  });
}

export async function saveMessages(
  conversationId: string,
  userMessage: string,
  aiReply: string
) {
  await prisma.message.createMany({
    data: [
      {
        conversationId,
        sender: "user",
        text: userMessage,
      },
      {
        conversationId,
        sender: "ai",
        text: aiReply,
      },
    ],
  });
}

export async function getConversationHistory(
  conversationId: string
) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: "asc" },
  });

  return messages.map((msg: any) => ({
    sender: msg.sender as "user" | "ai",
    text: msg.text,
  }));
}
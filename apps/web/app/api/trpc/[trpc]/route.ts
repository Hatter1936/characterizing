import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@characterizing/api'
import { createContext } from '@characterizing/api/src/trpc'

// обработчик запросов
const handler = (req: Request) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext,
        // перехватываем ответ
        responseMeta: () => ({}),
    }).then(async (response) => {
        // извлекаем куки
        const setCookieHeader = response.headers.get('Set-Cookie');
        // новый изменённый ответ
        const newResponse = new Response(response.body, response);

        if (setCookieHeader) {
            newResponse.headers.set('Set-Cookie', setCookieHeader)
        }
        return newResponse;
    });
};

export { handler as GET, handler as POST }
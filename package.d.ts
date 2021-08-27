declare namespace HTTP {

    interface Header {
        key: string, value: string
    }

    interface Request {
        method: 'POST' | 'GET' | 'PUT' | 'DELETE';
        path: string;
        version: string;
        headers: Header[];
        body: Buffer;
    }

    interface Response {
        status: number;
        headers: Header[];
        body: Buffer;
    }

    interface Message {
        request: Request;
        response: Response;
    }

    interface Env {
        root: string;
        session: string;
    }

}

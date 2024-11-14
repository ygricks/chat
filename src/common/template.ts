import { readFileSync } from 'fs';
import { join } from 'path';

type templateParam = {
    title: string;
    head: string;
    body: string;
};

export async function UseGeneralTemplate(data: templateParam): Promise<string> {
    let html = readFileSync(
        join(__dirname, '../../public/general_template.html'),
        'utf-8'
    );

    for (let key of Object.keys(data)) {
        html = html.replace(
            new RegExp('<tag>' + key + '</tag>', 'g'),
            data[key as keyof templateParam]
        );
    }

    return Promise.resolve(html);
}

type ErrorCodeType = {
    code: string;
    title: string;
};

export async function ErrorCode(data: ErrorCodeType): Promise<string> {
    let html = readFileSync(
        join(__dirname, '../../public/error_code.html'),
        'utf-8'
    );

    for (let key of Object.keys(data)) {
        html = html.replace(
            new RegExp('<tag>' + key + '</tag>', 'g'),
            data[key as keyof ErrorCodeType]
        );
    }

    return Promise.resolve(html);
}

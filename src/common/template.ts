import { readFileSync } from 'fs';
import { join } from 'path';

type templateParam = {
    title: string;
    head: string;
    body: string;
};

export function UseGeneralTemplate(data: templateParam): string {
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

    return html;
}

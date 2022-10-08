import { successResponse, wrap, IResponse } from "./utils/shared";
import fetch from "node-fetch"

const handler = async (
    _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
    let offset;
    let allRecords = [] as any[];
    do {
        const data:any = await fetch(`https://api.airtable.com/v0/app770zLfJWBdH0mP/Audits${offset ? `?offset=${offset}` : ''}`, {
            headers: {
                "Authorization": process.env.AIRTABLE_API_KEY!
            }
        }).then(r => r.json())
        offset = data.offset;
        allRecords = allRecords.concat(data.records)
    } while (offset !== undefined)
    

    const formattedAudits = allRecords.filter(r =>
        r.fields['Firm Name'] !== undefined &&
        r.fields["Audits Completed (match name on Defillama, separate with comma)"] !== undefined &&
        r.fields["Protcols Hacked"] !== undefined
    ).map(r => (
        {
        name: r.fields["Firm Name"],
        audits: r.fields["Audits Completed (match name on Defillama, separate with comma)"].split(',') ?? [],
        hacks: r.fields["Protcols Hacked"] ?? 0,
    }))


    return successResponse({
        audits: formattedAudits
    }, 10 * 60); // 10 mins cache
};

export default wrap(handler);
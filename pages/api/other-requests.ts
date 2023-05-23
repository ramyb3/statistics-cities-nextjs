import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return await read(req, res);
  }
  if (req.method === "POST") {
    return await send(req, res);
  }
}

const read = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resp = await axios.get(
      "https://data.gov.il/api/3/action/datastore_search?resource_id=64edd0ee-3d5d-43ce-8562-c336c24dbc1f&limit=10000"
    );

    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(500).json(e);
  }
};

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    //@ts-ignore
    await axios.post(process.env.NEXT_PUBLIC_MAIL, req.body);
    return res.status(200).json("");
  } catch (e) {
    return res.status(500).json(e);
  }
};

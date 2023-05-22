import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await read(req, res);
}

const read = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resp = await axios(
      `https://www.police.gov.il/MapSkifoutService?city=${req.body.cityID}&street=&house=&subjects=1,2,10,11,9,12,13,19,16,28,34,31,22,24,23,37,39,38,14,20,17,29,35,32,15,21,18,30,36,33&quarter=1,2,3,4&year=${req.body.year}`
    );

    return res.json(resp.data);
  } catch (e) {
    return res.status(500).json(e);
  }
};

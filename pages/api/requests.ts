import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parseCity } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await read(req, res);
}

const read = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let resp = await axios.get(
      `https://es.govmap.gov.il/TldSearch/api/DetailsByQuery?query=${parseCity(
        req.body.city
      )}&lyrs=8&gid=govmap`
    );

    const cityID = resp.data.data.SETTLEMENT[0].ObjectID;

    resp = await axios.post(
      `https://www.police.gov.il/MapSkifoutService?city=${cityID}&street=&house=&subjects=1,2,10,11,9,12,13,19,16,28,34,31,22,24,23,37,39,38,14,20,17,29,35,32,15,21,18,30,36,33&quarter=1,2,3,4&year=${req.body.year}`
    );

    return res.status(200).json(resp.data);
  } catch (e) {
    return res.status(500).json(e);
  }
};

import axiosClient from "./axiosClient";

/**
 * Fetch party management settings for the logged-in user.
 */
export const fetchPartySettings = () =>
  axiosClient.get("/settings/party").then((res) => res.data);

/**
 * Save/update party management settings.
 */
export const savePartySettings = (payload) =>
  axiosClient.put("/settings/party", payload).then((res) => res.data);




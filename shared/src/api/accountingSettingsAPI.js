import axiosClient from "./axiosClient";

export const getAccountingSettings = async () => {
  const response = await axiosClient.get("/settings/accounting");
  return response.data;
};

export const updateAccountingSettings = async (settingsData) => {
  const response = await axiosClient.put("/settings/accounting", settingsData);
  return response.data;
};




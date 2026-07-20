import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getInbox,
  syncEmailAccount,
  syncEmailAccounts,
} from "../api/email.api";

export const emailQueryKeys = {
  all: ["email"],

  inbox: ({
    companyId,
    accountId,
    page,
    limit,
  }) => [
    "email",
    "inbox",
    companyId || "default",
    accountId || "all",
    page,
    limit,
  ],
};

export function useEmailInbox({
  companyId,
  accountId,
  page = 1,
  limit = 25,
}) {
  return useQuery({
    queryKey: emailQueryKeys.inbox({
      companyId,
      accountId,
      page,
      limit,
    }),

    queryFn: async () => {
      const response = await getInbox({
        accountId,
        page,
        limit,
      });

      return response?.data ?? response;
    },

    placeholderData: (previousData) =>
      previousData,

    staleTime: 30_000,
  });
}

export function useSyncEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      limit = 50,
    } = {}) => {
      if (accountId) {
        const response =
          await syncEmailAccount(
            accountId,
            { limit }
          );

        return response?.data ?? response;
      }

      const response =
        await syncEmailAccounts({
          limit,
        });

      return response?.data ?? response;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["email", "inbox"],
      });
    },
  });
}
import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";

import api from "../../api/api";

function Users() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const usersPerPage = 5;

  const notify = (type, message) => {
    toast[type](message, {
      position: "bottom-center",
      autoClose: 1800,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      style: {
        background: "#FFF9F3",
        color: "#5A4030",
        border: "1px solid #E7DED5",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(90, 64, 48, 0.12)",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  };

  const {
    data: users = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      "admin-users",
      search,
      statusFilter,
      page,
      usersPerPage,
    ],

    queryFn: async () => {
      const params = {
        page,
        pageSize: usersPerPage,
        status: statusFilter,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get(
        "/admin/users",
        {
          params,
        }
      );

      const data =
        response.data?.data;

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    },

    placeholderData: (previousData) =>
      previousData,
  });

  const blockMutation = useMutation({
    mutationFn: async (user) => {
      const userId =
        user.id ??
        user.Id;

      const isBlocked =
        Boolean(
          user.isBlocked ??
            user.IsBlocked ??
            false
        );

      if (isBlocked) {
        await api.put(
          `/admin/users/${userId}/unblock`
        );
      } else {
        await api.put(
          `/admin/users/${userId}/block`
        );
      }

      return {
        userId,
        isBlocked,
      };
    },

    onSuccess: ({
      userId,
      isBlocked,
    }) => {
      const newBlockedValue =
        !isBlocked;

      setSelectedUser(
        (currentUser) => {
          if (!currentUser) {
            return currentUser;
          }

          const currentId =
            currentUser.id ??
            currentUser.Id;

          if (
            String(currentId) !==
            String(userId)
          ) {
            return currentUser;
          }

          return {
            ...currentUser,
            isBlocked:
              newBlockedValue,
          };
        }
      );

      setConfirmUser(null);

      notify("success", 
        newBlockedValue
          ? "User blocked successfully."
          : "User unblocked successfully."
      );
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },

    onError: (error) => {
      console.error(
        "Block/unblock user error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Unable to update user status.";

      notify("error", message);
    },
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleBlockToggle = (user) => {
    setConfirmUser(user);
  };

  const confirmBlockToggle = () => {
    if (!confirmUser) {
      return;
    }

    blockMutation.mutate(
      confirmUser
    );
  };

  const hasUsers =
    users.length > 0;

  const hasNextPage =
    users.length === usersPerPage;

  const handlePreviousPage = () => {
    setPage(
      (previousPage) =>
        Math.max(
          1,
          previousPage - 1
        )
    );
  };

  const handleNextPage = () => {
    if (!hasNextPage) {
      return;
    }

    setPage(
      (previousPage) =>
        previousPage + 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1EAE1] p-4 sm:p-6">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#30251F]">
          Users
        </h1>

        <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-8 mt-6 text-center text-[#7B6A5D]">
          Loading users...
        </div>

      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F1EAE1] p-4 sm:p-6">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#30251F]">
          Users
        </h1>

        <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-8 mt-6 text-center text-[#A33D2D]">
          Failed to load users.
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1EAE1] p-3 sm:p-6">

      

      <div className="mb-6">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#30251F]">
          Users
        </h1>

        <p className="text-sm text-[#7B6A5D] mt-1">
          Manage registered Kidzy customers
        </p>

      </div>

      

      <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-3">

          

          <div className="relative flex-1">

            <FaSearch
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#9B8B7D]
              "
            />

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={handleSearch}
              className="
                w-full
                border
                border-[#E0D5CA]
                rounded-xl
                py-3
                pl-11
                pr-4
                outline-none
                focus:border-[#8B6A52]
              "
            />

          </div>

          

          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="
              border
              border-[#E0D5CA]
              rounded-xl
              px-4
              py-3
              bg-[#FFF9F3]
              outline-none
              w-full
              md:w-52
            "
          >

            <option value="all">
              All Users
            </option>

            <option value="active">
              Active
            </option>

            <option value="blocked">
              Blocked
            </option>

          </select>

        </div>

      </div>

      

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        

        <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-5">

          <p className="text-sm text-[#7B6A5D]">
            Users on Page
          </p>

          <h2 className="text-3xl font-bold text-[#30251F] mt-2">
            {users.length}
          </h2>

        </div>

        

        <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-5">

          <p className="text-sm text-[#7B6A5D]">
            Current Page
          </p>

          <h2 className="text-3xl font-bold text-[#30251F] mt-2">
            {page}
          </h2>

        </div>

        

        <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm p-5">

          <p className="text-sm text-[#7B6A5D]">
            Page Size
          </p>

          <h2 className="text-3xl font-bold text-[#30251F] mt-2">
            {usersPerPage}
          </h2>

        </div>

      </div>

      

      <div className="bg-[#FFF9F3] rounded-2xl border border-[#E7DDD2] shadow-sm overflow-x-auto">

        <table className="w-full min-w-[800px]">

          <thead className="bg-[#F7F0E8]">

            <tr>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Email
              </th>

              <th className="text-left p-4">
                Phone
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-left p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {users.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="p-10 text-center text-[#7B6A5D]"
                >
                  No users found.
                </td>

              </tr>

            ) : (

              users.map((user) => {

                const userId =
                  user.id ??
                  user.Id;

                const name =
                  user.name ??
                  user.Name ??
                  "N/A";

                const email =
                  user.email ??
                  user.Email ??
                  "N/A";

                const phone =
                  user.phone ??
                  user.Phone;

                const blocked =
                  Boolean(
                    user.isBlocked ??
                      user.IsBlocked ??
                      false
                  );

                return (

                  <tr
                    key={userId}
                    className="
                      border-t border-[#E7DDD2]
                      hover:bg-[#F7F0E8]
                    "
                  >

                    

                    <td className="p-4">

                      <div>

                        <p className="font-medium text-[#30251F]">
                          {name}
                        </p>

                        <p className="text-xs text-[#9B8B7D] mt-1">
                          User ID: {userId}
                        </p>

                      </div>

                    </td>

                    

                    <td className="p-4 text-[#5A4030]">
                      {email}
                    </td>

                    

                    <td className="p-4 text-[#5A4030]">

                      {phone
                        ? `+91 ${phone}`
                        : "N/A"}

                    </td>

                    

                    <td className="p-4">

                      {blocked ? (

                        <span className="
                          bg-[#FCE8E4]
                          text-[#A33D2D]
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-medium
                        ">
                          Blocked
                        </span>

                      ) : (

                        <span className="
                          bg-[#E7F2E8]
                          text-[#376B42]
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-medium
                        ">
                          Active
                        </span>

                      )}

                    </td>

                    

                    <td className="p-4">

                      <div className="flex flex-wrap gap-2">

                        

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUser(
                              user
                            )
                          }
                          className="
                            border
                            border-[#E0D5CA]
                            px-3
                            py-2
                            rounded-lg
                            hover:bg-[#F7F0E8]
                            text-sm
                          "
                        >
                          View
                        </button>

                        

                        <button
                          type="button"
                          onClick={() =>
                            handleBlockToggle(
                              user
                            )
                          }
                          disabled={
                            blockMutation.isPending
                          }
                          className={`
                            px-4
                            py-2
                            rounded-lg
                            text-[#FFF9F3]
                            text-sm
                            disabled:opacity-50
                            ${
                              blocked
                                ? "bg-[#557A55] hover:bg-[#426342]"
                                : "bg-[#A34B3D] hover:bg-[#873B30]"
                            }
                          `}
                        >

                          {blocked
                            ? "Unblock"
                            : "Block"}

                        </button>

                      </div>

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

      

      {hasUsers && (

        <div className="
          flex
          justify-center
          items-center
          gap-2
          flex-wrap
          mt-6
        ">

          

          <button
            type="button"
            disabled={
              page === 1 ||
              isFetching
            }
            onClick={
              handlePreviousPage
            }
            className="
              border
              bg-[#FFF9F3]
              px-4
              py-2
              rounded-xl
              disabled:opacity-50
            "
          >
            Prev
          </button>

          

          <span className="
            border
            bg-[#5A4030]
            text-[#FFF9F3]
            px-4
            py-2
            rounded-xl
          ">
            Page {page}
          </span>

          

          <button
            type="button"
            disabled={
              !hasNextPage ||
              isFetching
            }
            onClick={
              handleNextPage
            }
            className="
              border
              bg-[#FFF9F3]
              px-4
              py-2
              rounded-xl
              disabled:opacity-50
            "
          >
            Next
          </button>

        </div>

      )}

      

      {isFetching && !isLoading && (

        <div className="
          text-center
          text-sm
          text-[#7B6A5D]
          mt-3
        ">
          Loading...
        </div>

      )}

      

      {selectedUser && (

        <div className="
          fixed
          inset-0
          bg-[#5A4030]/40
          flex
          items-center
          justify-center
          z-50
          p-4
        ">

          <div className="
            bg-[#FFF9F3]
            w-full
            max-w-lg
            rounded-2xl
            shadow-xl
            p-6
            max-h-[90vh]
            overflow-y-auto
          ">

            

            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <h2 className="
                text-xl
                sm:text-2xl
                font-bold
                text-[#30251F]
              ">
                User Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                className="
                  text-xl
                  text-[#7B6A5D]
                  hover:text-[#30251F]
                "
              >
                ✕
              </button>

            </div>

            

            <div className="space-y-4">

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Name
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.name ??
                    selectedUser.Name ??
                    "N/A"}
                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Email
                </p>

                <p className="
                  font-medium
                  mt-1
                  break-all
                ">
                  {selectedUser.email ??
                    selectedUser.Email ??
                    "N/A"}
                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Phone
                </p>

                <p className="font-medium mt-1">

                  {(selectedUser.phone ??
                    selectedUser.Phone)
                    ? `+91 ${
                        selectedUser.phone ??
                        selectedUser.Phone
                      }`
                    : "N/A"}

                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Address
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.address ??
                    selectedUser.Address ??
                    "N/A"}
                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  PIN Code
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.pincode ??
                    selectedUser.Pincode ??
                    "N/A"}
                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Role
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.role ??
                    selectedUser.Role ??
                    "N/A"}
                </p>

              </div>

              

              <div>

                <p className="text-xs text-[#7B6A5D]">
                  Status
                </p>

                <div className="mt-2">

                  {Boolean(
                    selectedUser.isBlocked ??
                      selectedUser.IsBlocked ??
                      false
                  ) ? (

                    <span className="
                      bg-[#FCE8E4]
                      text-[#A33D2D]
                      px-3
                      py-1
                      rounded-full
                      text-sm
                    ">
                      Blocked
                    </span>

                  ) : (

                    <span className="
                      bg-[#E7F2E8]
                      text-[#376B42]
                      px-3
                      py-1
                      rounded-full
                      text-sm
                    ">
                      Active
                    </span>

                  )}

                </div>

              </div>

            </div>

            

            <div className="
              flex
              justify-end
              mt-6
            ">

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                className="
                  border
                  border-[#E0D5CA]
                  px-5
                  py-2
                  rounded-xl
                  hover:bg-[#F7F0E8]
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      

      {confirmUser && (

        <div className="
          fixed
          inset-0
          bg-[#5A4030]/40
          flex
          items-center
          justify-center
          z-50
          p-4
        ">

          <div className="
            bg-[#FFF9F3]
            w-full
            max-w-sm
            rounded-2xl
            shadow-xl
            p-6
            text-center
          ">

            

            <h2 className="
              text-xl
              font-bold
              text-[#30251F]
            ">

              {Boolean(
                confirmUser.isBlocked ??
                  confirmUser.IsBlocked ??
                  false
              )
                ? "Unblock User?"
                : "Block User?"}

            </h2>

            

            <p className="
              text-sm
              text-[#7B6A5D]
              mt-2
            ">

              {Boolean(
                confirmUser.isBlocked ??
                  confirmUser.IsBlocked ??
                  false
              )
                ? `Allow ${
                    confirmUser.name ??
                    confirmUser.Name ??
                    "this user"
                  } to use the account again?`
                : `Prevent ${
                    confirmUser.name ??
                    confirmUser.Name ??
                    "this user"
                  } from using the account?`}

            </p>

            

            <div className="
              flex
              justify-center
              gap-3
              mt-6
            ">

              

              <button
                type="button"
                onClick={() =>
                  setConfirmUser(
                    null
                  )
                }
                className="
                  border
                  border-[#E0D5CA]
                  px-5
                  py-2
                  rounded-xl
                  hover:bg-[#F7F0E8]
                "
              >
                Cancel
              </button>

              

              <button
                type="button"
                onClick={
                  confirmBlockToggle
                }
                disabled={
                  blockMutation.isPending
                }
                className={`
                  px-5
                  py-2
                  rounded-xl
                  text-[#FFF9F3]
                  disabled:opacity-50
                  ${
                    Boolean(
                      confirmUser.isBlocked ??
                        confirmUser.IsBlocked ??
                        false
                    )
                      ? "bg-[#557A55] hover:bg-[#426342]"
                      : "bg-[#A34B3D] hover:bg-[#873B30]"
                  }
                `}
              >

                {blockMutation.isPending
                  ? "Please wait..."
                  : Boolean(
                      confirmUser.isBlocked ??
                        confirmUser.IsBlocked ??
                        false
                    )
                  ? "Unblock"
                  : "Block"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;
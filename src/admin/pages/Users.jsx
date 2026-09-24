import { useMemo, useState } from "react";
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

  // FETCH USERS
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get("/users");

      if (!Array.isArray(response.data)) {
        return [];
      }

      // Do not show admin users in the customer list.
      return response.data.filter(
        (user) =>
          String(user.role || "").toLowerCase() !== "admin"
      );
    },
  });

  // BLOCK / UNBLOCK
  const blockMutation = useMutation({
    mutationFn: async (user) => {
      const newBlockedValue = !Boolean(user.blocked);

      const response = await api.patch(`/users/${user.id}`, {
        blocked: newBlockedValue,
      });

      return response.data;
    },

    onSuccess: (updatedUser) => {
      queryClient.setQueryData(
        ["admin-users"],
        (currentUsers = []) =>
          currentUsers.map((user) =>
            String(user.id) === String(updatedUser.id)
              ? {
                  ...user,
                  ...updatedUser,
                }
              : user
          )
      );

      setSelectedUser((currentUser) => {
        if (
          currentUser &&
          String(currentUser.id) ===
            String(updatedUser.id)
        ) {
          return {
            ...currentUser,
            ...updatedUser,
          };
        }

        return currentUser;
      });

      setConfirmUser(null);

      toast.success(
        updatedUser.blocked
          ? "User blocked successfully."
          : "User unblocked successfully."
      );
    },

    onError: (error) => {
      console.error("Block user error:", error);
      toast.error("Unable to update user status.");
    },
  });

  // SEARCH + FILTER
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...users]
      .sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
      )
      .filter((user) => {
        const name = String(
          user.name || ""
        ).toLowerCase();

        const email = String(
          user.email || ""
        ).toLowerCase();

        const phone = String(
          user.phone || ""
        ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          name.includes(searchValue) ||
          email.includes(searchValue) ||
          phone.includes(searchValue);

        const isBlocked = Boolean(user.blocked);

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "blocked"
            ? isBlocked
            : !isBlocked;

        return (
          matchesSearch &&
          matchesStatus
        );
      });
  }, [users, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / usersPerPage
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

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

    blockMutation.mutate(confirmUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Users
        </h1>

        <div className="bg-white rounded-2xl shadow p-8 mt-6 text-center text-gray-500">
          Loading users...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Users
        </h1>

        <div className="bg-white rounded-2xl shadow p-8 mt-6 text-center text-red-500">
          Failed to load users.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-3 sm:p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Users
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage registered Kidzy customers
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={handleSearch}
              className="w-full border border-gray-300 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-gray-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none w-full md:w-52"
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Total Users
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {users.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Active Users
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              users.filter(
                (user) => !user.blocked
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Blocked Users
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {
              users.filter(
                (user) => Boolean(user.blocked)
              ).length
            }
          </h2>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">

        <table className="w-full min-w-[800px]">

          <thead className="bg-gray-100">
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

            {currentUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-10 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => {

                const blocked =
                  Boolean(user.blocked);

                return (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.name || "N/A"}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          User ID: {user.id}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600">
                      {user.email || "N/A"}
                    </td>

                    <td className="p-4 text-gray-600">
                      {user.phone
                        ? `+91 ${user.phone}`
                        : "N/A"}
                    </td>

                    <td className="p-4">
                      {blocked ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Blocked
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4">

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUser(user)
                          }
                          className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBlockToggle(user)
                          }
                          disabled={
                            blockMutation.isPending
                          }
                          className={`px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 ${
                            blocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
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

      {/* PAGINATION */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-center items-center gap-2 flex-wrap mt-6">

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setPage((previous) =>
                Math.max(1, previous - 1)
              )
            }
            className="border bg-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              onClick={() =>
                setPage(pageNumber)
              }
              className={`border px-4 py-2 rounded-xl ${
                currentPage === pageNumber
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setPage((previous) =>
                Math.min(
                  totalPages,
                  previous + 1
                )
              )
            }
            className="border bg-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}

      {/* VIEW USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                User Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(null)
                }
                className="text-xl text-gray-500 hover:text-black"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-gray-500">
                  Name
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="font-medium mt-1 break-all">
                  {selectedUser.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.phone
                    ? `+91 ${selectedUser.phone}`
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Address
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.address || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  PIN Code
                </p>

                <p className="font-medium mt-1">
                  {selectedUser.pincode || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <div className="mt-2">
                  {selectedUser.blocked ? (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Blocked
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end mt-6">

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(null)
                }
                className="border border-gray-300 px-5 py-2 rounded-xl hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* BLOCK CONFIRM MODAL */}
      {confirmUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center">

            <h2 className="text-xl font-bold text-gray-800">
              {confirmUser.blocked
                ? "Unblock User?"
                : "Block User?"}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {confirmUser.blocked
                ? `Allow ${confirmUser.name || "this user"} to use the account again?`
                : `Prevent ${confirmUser.name || "this user"} from using the account?`}
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setConfirmUser(null)
                }
                className="border border-gray-300 px-5 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmBlockToggle}
                disabled={blockMutation.isPending}
                className={`px-5 py-2 rounded-xl text-white disabled:opacity-50 ${
                  confirmUser.blocked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {blockMutation.isPending
                  ? "Please wait..."
                  : confirmUser.blocked
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

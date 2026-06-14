import { useEffect, useState } from "react";

function Users() {

  const [users, setUsers] = useState([]);

  // FETCH USERS

  useEffect(() => {

    const loadUsers = async () => {

      try {

        const res = await fetch(
          "http://localhost:3001/users"
        );

        const data = await res.json();
        let filterdUser = data.slice(1)

        setUsers(filterdUser);

      } catch (err) {

        console.log(err);
      }
    };

    loadUsers();

  }, []);

  // BLOCK / UNBLOCK USER

  const handleBlockToggle =
    async (user) => {

      try {

        const updatedUser = {

          ...user,

          blocked: !user.blocked,
        };

        await fetch(
          `http://localhost:3001/users/${user.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              updatedUser
            ),
          }
        );

        setUsers((prev) =>

          prev.map((u) =>

            u.id === user.id
              ? updatedUser
              : u
          )
        );

      } catch (err) {

        console.log(err);
      }
    };

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">

        Users

      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Email
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

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t"
              >

                <td className="p-4">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4">

                  {user.blocked ? (

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">

                      Blocked

                    </span>

                  ) : (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                      Active

                    </span>
                  )}

                </td>

                <td className="p-4">

                  <button
                    onClick={() =>
                      handleBlockToggle(user)
                    }
                    className={`px-4 py-1 rounded-md text-white ${user.blocked
                        ? "bg-green-500"
                        : "bg-red-500"
                      }`}
                  >

                    {user.blocked
                      ? "Unblock"
                      : "Block"}

                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Users;
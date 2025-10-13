import React, { useEffect, useState } from 'react';
import View from './view';
import { useNavigate } from 'react-router-dom';
import NotFound from './notFound';
import Button from '../components/button';
import { pizzaService } from '../service/service';
import { Franchise, FranchiseList, Role, Store, User } from '../service/pizzaService';
import { TrashIcon } from '../icons';


interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();
  const user = props.user || ({} as User);
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({ franchises: [], more: false });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 8;

  // ✅ Fetch users from backend
  async function getUserList() {
    try {
      const allUsers = await pizzaService.getUserList();
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  // ✅ Delete user via service call
  async function removeUser(user: User) {
    try {
      await pizzaService.deleteUser(user);
      setUsers((prev) => prev.filter((u) => u.email !== user.email));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

    // load users on mount
  useEffect(() => {
    getUserList();
  }, []);

  // filter users by name (case-insensitive)
  const filtered = users.filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // pagination
  const start = page * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);


  
  // const [users, setUsers] = useState([
  //   { name: "Joe", email: "j@jwt.com", role: "admin" },
  //   { name: "Betty", email: "b@jwt.com", role: "diner" },
  //   { name: "Sam", email: "s@cow.io", role: "diner" },
  //   { name: "常用名字", email: "常@my.io", role: "diner" },
  //   { name: "Diner", email: "d@ms.com", role: "franchisee" },
  //   { name: "Franco", email: "f@ms.com", role: "diner" },
  //   { name: "Buddy", email: "b@byu.edu", role: "franchisee" },
  //   { name: "Mac", email: "ch@byu.edu", role: "admin" },
  //   { name: "Juan", email: "j@gmail.com", role: "diner" },
  //   { name: "Jamie", email: "jm@jwt.com", role: "diner" },
  // ]);


  React.useEffect(() => {
    (async () => {
      setFranchiseList(await pizzaService.getFranchises(franchisePage, 3, '*'));
    })();
  }, [props.user, franchisePage]);

  function createFranchise() {
    navigate('/admin-dashboard/create-franchise');
  }

  async function closeFranchise(franchise: Franchise) {
    navigate('/admin-dashboard/close-franchise', { state: { franchise: franchise } });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate('/admin-dashboard/close-store', { state: { franchise: franchise, store: store } });
  }

  async function filterFranchises() {
    setFranchiseList(await pizzaService.getFranchises(franchisePage, 10, `*${filterFranchiseRef.current?.value}*`));
  }

  
  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
          <div className="bg-slate-600 min-h-screen flex items-center justify-center">
            <div className="bg-slate-700 text-white p-4 w-[400px] rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      <div className="overflow-x-auto bg-white rounded text-black">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-200 text-gray-700 text-sm">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">Role</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, i) => (
              <tr
                key={i}
                className="border-t border-gray-200 hover:bg-gray-100 transition"
              >
                <td className="px-3 py-1">{user.name}</td>
                <td className="px-3 py-1">{user.email}</td>
                <td>
                  {user.roles?.map((role) => (
                    <span
                      key={String(role)}
                      className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1"
                    >
                      {String(role)}
                    </span>
                  )) ?? "No roles"}
                </td>
                <td className="px-3 py-1 text-center">
                  <button
                  onClick={() => removeUser(user)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Search + Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => setPage(0)}
            className="bg-gray-200 px-2 py-1 text-sm rounded hover:bg-gray-300"
          >
            Search
          </button>
        </div>
        <div className="flex gap-1">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-gray-200 px-2 py-1 text-sm rounded hover:bg-gray-300 disabled:bg-gray-100"
          >
            Prev
          </button>
          <button
            disabled={end >= filtered.length}
            onClick={() => setPage(page + 1)}
            className="bg-gray-200 px-2 py-1 text-sm rounded hover:bg-gray-300 disabled:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
</div>

        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-neutral-100 text-xl">Franchises</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {['Franchise', 'Franchisee', 'Store', 'Revenue', 'Action'].map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {franchiseList.franchises.map((franchise, findex) => {
                        return (
                          <tbody key={findex} className="divide-y divide-gray-200">
                            <tr className="border-neutral-500 border-t-2">
                              <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">{franchise.name}</td>
                              <td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800" colSpan={3}>
                                {franchise.admins?.map((o) => o.name).join(', ')}
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800" onClick={() => closeFranchise(franchise)}>
                                  <TrashIcon />
                                  Close
                                </button>
                              </td>
                            </tr>

                            {franchise.stores.map((store, sindex) => {
                              return (
                                <tr key={sindex} className="bg-neutral-100">
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800" colSpan={3}>
                                    {store.name}
                                  </td>
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">{store.totalRevenue?.toLocaleString()} ₿</td>
                                  <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                    <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={() => closeStore(franchise, store)}>
                                      <TrashIcon />
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        );
                      })}
                      <tfoot>
                        <tr>
                          <td className="px-1 py-1">
                            <input type="text" ref={filterFranchiseRef} name="filterFranchise" placeholder="Filter franchises" className="px-2 py-1 text-sm border border-gray-300 rounded-lg" />
                            <button type="submit" className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={filterFranchises}>
                              Submit
                            </button>
                          </td>
                          <td colSpan={4} className="text-end text-sm font-medium">
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 " onClick={() => setFranchisePage(franchisePage - 1)} disabled={franchisePage <= 0}>
                              «
                            </button>
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300" onClick={() => setFranchisePage(franchisePage + 1)} disabled={!franchiseList.more}>
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button className="w-36 text-xs sm:text-sm sm:w-64" title="Add Franchise" onPress={createFranchise} />
        </div>
      </View>
    );
  }

  return response;
}

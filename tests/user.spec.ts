import { test, expect } from 'playwright-test-coverage';
import { Page } from "@playwright/test";
import {Role, User} from "../src/service/pizzaService";

async function basicInitAdmin(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'a@jwt.com': { id: '4', name: 'a', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] }};

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });




  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // create a new franchise
  await page.route("*/**/api/franchise", async (route) => {
  expect(route.request().method()).toBe("POST");
  await route.fulfill({
    json: { id: 123, name: "good morning" },
  });
   
  });

  // Close (delete) a franchise
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    expect(route.request().method()).toBe("DELETE");
    
    // You can read the franchise ID from the URL if needed
    const url = route.request().url();
    const id = url.split("/").pop();
    console.log(`Mock: deleting franchise ${id}`);

    await route.fulfill({
      json: { message: `Franchise ${id} closed successfully` },
    });
  });

  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
  expect(route.request().method()).toBe("DELETE");

  const parts = route.request().url().split("/");
  const franchiseId = parts[parts.length - 3];
  const storeId = parts[parts.length - 1];
  console.log(`Mock: deleting store ${storeId} from franchise ${franchiseId}`);

  await route.fulfill({
    json: { message: `Store ${storeId} from franchise ${franchiseId} deleted successfully` },
  });
});


  await page.goto('/');
}

async function basicInitDiner(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] }};

  await page.route('**/logout', async (route) => {
  loggedInUser = undefined; // clear the logged-in user
  await route.fulfill({ status: 200, body: 'Logged out' });
  });
  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
  const loginReq = route.request().postDataJSON();
  if (!loginReq || !loginReq.email) {
    // Not a login request; let it continue or fail gracefully
    await route.continue();
    return;
  }

  const user = validUsers[loginReq.email];
  if (!user || user.password !== loginReq.password) {
    await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    return;
  }

  loggedInUser = user;
  const loginRes = {
    user: loggedInUser,
    token: 'abcdef',
  };
  expect(route.request().method()).toBe('PUT');
  await route.fulfill({ json: loginRes });
});


  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  // Get previous orders
await page.route('*/**/api/order', async (route) => {
  if (route.request().method() === 'GET') {
    const previousOrdersRes = [
      {
        id: 21,
        title: 'Veggie',
        price: 0.0038,
        description: 'A garden of delight',
        date: '2025-10-01T15:42:00Z',
      },
      {
        id: 22,
        title: 'Pepperoni',
        price: 0.0042,
        description: 'Spicy treat',
        date: '2025-10-05T19:13:00Z',
      },
    ];
    await route.fulfill({ json: previousOrdersRes });
  } else if (route.request().method() === 'POST') {
    // Handle placing a new order (your existing logic)
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    await route.fulfill({ json: orderRes });
  } else {
    // Optional: handle unexpected methods gracefully
    await route.fulfill({ status: 405, json: { error: 'Method not allowed' } });
  }
});

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
  expect(route.request().method()).toBe("GET");

  // Extract the ID from the URL
  const id = Number(route.request().url().split("/").pop());

  const franchiseDetail = {
    id,
    name: "LotaPizza",
    stores: [
      { id: 4, name: "Lehi" },
      { id: 5, name: "Springville" },
      { id: 6, name: "American Fork" },
    ],
  };

  await route.fulfill({ json: franchiseDetail });
});


  await page.goto('/');
}

test('updateUser', async ({ page }) => {
    // Mock the PUT request to update the user
    await page.route('**/api/user/*', async (route) => {
    const request = route.request();

    if (request.method() === 'PUT') {

        // You can log or inspect the payload if needed
        const data = await request.postDataJSON();

        // Respond with a fake updated user + token, same shape as your backend would
        await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            user: {
            id: data.id,
            name: data.name,
            email: data.email,
            roles: data.roles,
            },
            token: 'mocked-jwt-token',
        }),
        });
    } else {
        await route.continue();
    }
    });

    await basicInitAdmin(page);

    // await page.getByRole('link', { name: 'Register' }).click();
    // await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    // await page.getByRole('textbox', { name: 'Email address' }).fill("d@jwt.com");
    // await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    // await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'a', exact: true }).click();

    await expect(page.getByRole('main')).toContainText('a');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    // await page.getByRole('button', { name: 'Update' }).click();

    // await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

    await expect(page.getByRole('main')).toContainText('a');

    // await page.getByRole('button', { name: 'Edit' }).click();
    // await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('andy');
    await page.getByRole('textbox').nth(1).fill("andy@jwt.com");
    await page.getByRole('button', { name: 'Update' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
    await expect(page.getByRole('main')).toContainText('andy');

    
});



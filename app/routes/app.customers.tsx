import {
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { Form, useSubmit } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { createCustomer } from "./api/prisma.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const response = await admin.graphql(
      `#graphql
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        id
        email
        phone
        firstName
        lastName
        smsMarketingConsent {
          marketingState
          marketingOptInLevel
        }
        addresses {
          address1
          city
          country
          phone
          zip
        }
      }
    }
  }`,
      {
        variables: {
          input: {
            email: formData.get("email"),
            phone: formData.get("phone"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            addresses: [
              {
                address1: "412 fake st",
                city: "Ottawa",
                province: "ON",
                phone: formData.get("phone"),
                zip: "A1A 4A1",
                lastName: formData.get("lastName"),
                firstName: formData.get("firstName"),
                country: "CA",
              },
            ],
          },
        },
      },
    );

    const {
      data: { customerCreate },
    } = await response.json();

    const now = new Date();
    const id = now.getTime().toString();

    await createCustomer({
      id: id,
      firstName: formData.get("firstName")?.toString(),
      lastName: formData.get("lastName")?.toString(),
      email: formData.get("email")?.toString(),
      phone: formData.get("phone")?.toString(),
    });

    console.log(customerCreate);

    return null;
  } catch (error: any) {
    return new Response(error.message, {
      status: 400,
    });
  }
};

export default function AdditionalPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const submit = useSubmit();
  return (
    <Page>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Card>
            <Form
              method="post"
              onSubmit={() => submit({}, { method: "post", replace: true })}
            >
              <InlineGrid columns={2} gap={"400"}>
                <TextField
                  label="First name"
                  name="firstName"
                  autoComplete="on"
                  value={firstName}
                  onChange={(value) => setFirstName(value)}
                />
                <TextField
                  label="Last name"
                  name="lastName"
                  autoComplete="on"
                  value={lastName}
                  onChange={(value) => setLastName(value)}
                />
              </InlineGrid>
              <InlineGrid columns={2} gap={"400"}>
                <TextField
                  label="Email"
                  name="email"
                  autoComplete="on"
                  value={email}
                  onChange={(value) => setEmail(value)}
                />
                <TextField
                  type="number"
                  maxLength={10}
                  label="Phone"
                  name="phone"
                  autoComplete="on"
                  value={phone}
                  onChange={(value) => setPhone(value)}
                />
              </InlineGrid>
              <div style={{ marginTop: "20px" }}>
                <Button variant="primary" submit>
                  Submit
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

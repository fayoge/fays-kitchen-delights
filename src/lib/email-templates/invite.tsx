import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "Georgia, 'Times New Roman', serif",
}
const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  border: '1px solid #EADFD3',
  borderRadius: '14px',
  borderTop: '6px solid #B85C38',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#3B2A20',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6B5A4E',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: '#B85C38', textDecoration: 'underline' }
const button = {
  backgroundColor: '#B85C38',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = {
  fontSize: '12px',
  color: '#9A8B80',
  margin: '30px 0 0',
  borderTop: '1px solid #EADFD3',
  paddingTop: '16px',
}

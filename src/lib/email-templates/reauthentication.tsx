import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  backgroundColor: '#FBF6F0',
  color: '#3B2A20',
  border: '1px solid #EADFD3',
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 30px',
}
const footer = {
  fontSize: '12px',
  color: '#9A8B80',
  margin: '30px 0 0',
  borderTop: '1px solid #EADFD3',
  paddingTop: '16px',
}

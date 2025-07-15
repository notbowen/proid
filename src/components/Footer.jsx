import { BxlLinkedin, BxlFacebook, BxlInstagram, RestrictedFooter } from '@opengovsg/design-system-react'

const Footer = () => {
    return (
      <RestrictedFooter 
        appName="URA Draft Master Plan 2025"
        footerLinks={[
        {
          href: '',
          label: 'User Guide'
        },
        {
          href: '',
          label: 'Privacy'
        },
        {
          href: '',
          label: 'Terms of Use'
        },
        {
          href: '',
          label: 'Report Vulnerability'
        }
      ]}
      socialMediaLinks={
        [
          {
            href: 'https://sg.linkedin.com/company/open-government-products',
            Icon: BxlLinkedin,
            label: 'Go to our LinkedIn page'
          },
          {
            href: 'https://www.facebook.com/opengovsg',
            Icon: BxlFacebook,
            label: 'Go to our Facebook page'
          },
          {
            href: 'https://www.instagram.com/opengovsg',
            Icon: BxlInstagram,
            label: 'Go to our Instagram page'
          }
        ]
      }
      />
    )
}

export default Footer
/**
 * Email templates — pure functions that build `EmailMessage` objects.
 * Each template supports the three site languages via a `locale` arg.
 *
 * Keep styling inline: most email clients strip external CSS and many
 * ignore `<style>` in the head. A touch of inline CSS and the brand
 * teal (#15b886) is enough to look intentional.
 */

import type { EmailMessage } from './email';

type Locale = 'ar' | 'fr' | 'en';

const isRtl = (l: Locale) => l === 'ar';

function baseWrap(locale: Locale, title: string, bodyHtml: string): string {
  const dir = isRtl(locale) ? 'rtl' : 'ltr';
  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#15b886 0%,#2a9ed4 100%);padding:28px 32px;color:#ffffff;">
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.01em;">MediConnect</div>
          <div style="margin-top:2px;font-size:13px;opacity:0.85;">${title}</div>
        </td></tr>
        <tr><td style="padding:32px;color:#0f172a;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:${isRtl(locale) ? 'right' : 'left'};border-top:1px solid #e2e8f0;">
          ${isRtl(locale)
            ? 'رسالة آليّة من منصّة MediConnect. للاستفسار: support@mediconnect.dz'
            : locale === 'fr'
            ? 'Email automatique de MediConnect. Questions : support@mediconnect.dz'
            : 'Automated email from MediConnect. Questions: support@mediconnect.dz'}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Template 1 — order confirmation (sent when an order is created)
// ---------------------------------------------------------------------------
export function orderConfirmationEmail(opts: {
  to: string;
  fullName: string;
  orderId: string;
  totalDZD: number;
  paymentMethod: 'cash' | 'ccp' | 'edahabia';
  locale: Locale;
}): EmailMessage {
  const { to, fullName, orderId, totalDZD, paymentMethod, locale } = opts;

  const strings = {
    ar: {
      subject:  `تمّ استلام طلبك #${orderId.slice(-8)}`,
      title:    'تأكيد الطلب',
      greeting: `مرحباً ${fullName}،`,
      body:     'شكراً لثقتك بـ MediConnect. تمّ استلام طلبك بنجاح، وها هو ملخّصه:',
      orderRef: 'رقم الطلب',
      amount:   'المبلغ',
      method:   'طريقة الدفع',
      methodLabels: { cash: 'دفع نقدي في المكتب', ccp: 'CCP / بريدي موب', edahabia: 'بطاقة الذهبيّة' },
      next:     paymentMethod === 'ccp'
        ? 'سنقوم بتفعيل طلبك فور التحقّق من إيصال CCP الذي رفعته.'
        : paymentMethod === 'edahabia'
        ? 'طلبك مؤكّد وسيبدأ التجهيز فوراً.'
        : 'يُرجى الحضور إلى مكتبنا للدفع والاستلام.',
    },
    fr: {
      subject:  `Votre commande #${orderId.slice(-8)} est reçue`,
      title:    'Confirmation de commande',
      greeting: `Bonjour ${fullName},`,
      body:     'Merci pour votre confiance. Votre commande a bien été reçue, voici son récapitulatif :',
      orderRef: 'Numéro de commande',
      amount:   'Montant',
      method:   'Mode de paiement',
      methodLabels: { cash: 'Paiement à notre bureau', ccp: 'CCP / Baridi Mob', edahabia: 'Carte Edahabia' },
      next:     paymentMethod === 'ccp'
        ? 'Nous activerons votre commande dès vérification du reçu CCP.'
        : paymentMethod === 'edahabia'
        ? 'Votre commande est confirmée et le traitement commence immédiatement.'
        : 'Veuillez passer à notre bureau pour régler et récupérer.',
    },
    en: {
      subject:  `Your order #${orderId.slice(-8)} is received`,
      title:    'Order confirmation',
      greeting: `Hi ${fullName},`,
      body:     'Thanks for ordering from MediConnect. Your order has been received. Summary:',
      orderRef: 'Order #',
      amount:   'Amount',
      method:   'Payment method',
      methodLabels: { cash: 'Cash at our office', ccp: 'CCP / Baridi Mob', edahabia: 'Edahabia card' },
      next:     paymentMethod === 'ccp'
        ? 'Your order will be activated once we verify your CCP receipt.'
        : paymentMethod === 'edahabia'
        ? 'Your order is confirmed and processing begins immediately.'
        : 'Please visit our office to pay and pick up.',
    },
  }[locale];

  const align = isRtl(locale) ? 'right' : 'left';
  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:700;">${strings.greeting}</p>
    <p style="margin:0 0 20px;">${strings.body}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:12px;padding:16px;margin:20px 0;">
      <tr><td style="padding:8px 12px;color:#64748b;font-size:13px;text-align:${align};">${strings.orderRef}</td>
          <td style="padding:8px 12px;font-weight:700;font-family:ui-monospace,monospace;text-align:${align === 'left' ? 'right' : 'left'};">#${orderId.slice(-8)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;font-size:13px;text-align:${align};">${strings.method}</td>
          <td style="padding:8px 12px;font-weight:700;text-align:${align === 'left' ? 'right' : 'left'};">${strings.methodLabels[paymentMethod]}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;font-size:13px;text-align:${align};">${strings.amount}</td>
          <td style="padding:8px 12px;font-weight:800;color:#15b886;font-size:18px;text-align:${align === 'left' ? 'right' : 'left'};">${totalDZD.toLocaleString()} DZD</td></tr>
    </table>
    <p style="margin:0 0 8px;padding:12px 16px;background:#fef3c7;border-radius:12px;font-size:14px;color:#713f12;">${strings.next}</p>
  `;

  return {
    to,
    subject: strings.subject,
    html: baseWrap(locale, strings.title, body),
    text: `${strings.greeting}\n\n${strings.body}\n${strings.orderRef}: ${orderId}\n${strings.amount}: ${totalDZD} DZD\n${strings.method}: ${strings.methodLabels[paymentMethod]}\n\n${strings.next}`,
  };
}

// ---------------------------------------------------------------------------
// Template 2 — CCP payment verified (sent when admin approves the receipt)
// ---------------------------------------------------------------------------
export function ccpVerifiedEmail(opts: {
  to: string; fullName: string; orderId: string; locale: Locale;
}): EmailMessage {
  const { to, fullName, orderId, locale } = opts;

  const s = {
    ar: { subject: `تمّ تأكيد دفعة الطلب #${orderId.slice(-8)}`,
          title:   'تأكيد الدفع',
          greeting:`مرحباً ${fullName}،`,
          body:    'تمّ التحقّق من إيصال CCP واعتماد الدفع. سيبدأ تجهيز طلبك وشحنه فور توفّره لدى المورد.',
          close:   'شكراً لصبرك.' },
    fr: { subject: `Paiement de la commande #${orderId.slice(-8)} confirmé`,
          title:   'Paiement confirmé',
          greeting:`Bonjour ${fullName},`,
          body:    'Nous avons vérifié votre reçu CCP et validé le paiement. Votre commande sera préparée et expédiée dès que le fournisseur l\'aura en stock.',
          close:   'Merci de votre patience.' },
    en: { subject: `Payment for order #${orderId.slice(-8)} confirmed`,
          title:   'Payment confirmed',
          greeting:`Hi ${fullName},`,
          body:    'We have verified your CCP receipt and approved the payment. Your order will be prepared and shipped as soon as the supplier has stock.',
          close:   'Thanks for your patience.' },
  }[locale];

  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:700;">${s.greeting}</p>
    <div style="margin:20px 0;padding:20px;background:#d1fae5;border-radius:16px;text-align:center;">
      <div style="font-size:32px;">✓</div>
      <div style="margin-top:8px;font-weight:800;color:#065f46;font-size:16px;">${s.title}</div>
    </div>
    <p style="margin:0 0 16px;">${s.body}</p>
    <p style="margin:0;color:#64748b;font-size:14px;">${s.close}</p>
  `;

  return { to, subject: s.subject, html: baseWrap(locale, s.title, body),
           text: `${s.greeting}\n\n${s.body}\n\n${s.close}` };
}

// ---------------------------------------------------------------------------
// Template 3 — supplier account approved (sent when admin verifies)
// ---------------------------------------------------------------------------
export function supplierApprovedEmail(opts: {
  to: string; businessName: string; locale: Locale;
}): EmailMessage {
  const { to, businessName, locale } = opts;
  const s = {
    ar: { subject: 'تمّ اعتماد حساب مؤسّستك على MediConnect',
          title:   'اعتماد حساب المورّد',
          greeting:`مرحباً ${businessName}،`,
          body:    'تمّ اعتماد حسابكم رسميّاً كمورّد موثّق. يمكنكم الآن إضافة منتجاتكم والردّ على طلبات العروض والاستفادة من كل مزايا باقتكم.',
          cta:     'الدخول إلى لوحة المورّد',
          footer:  'إذا أردتم ترقية الباقة، تواصلوا مع فريقنا.' },
    fr: { subject: 'Votre compte fournisseur MediConnect est approuvé',
          title:   'Compte fournisseur approuvé',
          greeting:`Bonjour ${businessName},`,
          body:    'Votre compte a été officiellement approuvé comme fournisseur vérifié. Vous pouvez maintenant ajouter vos produits, répondre aux demandes de devis et profiter de tous les avantages de votre formule.',
          cta:     'Accéder au tableau de bord',
          footer:  'Pour passer à une formule supérieure, contactez notre équipe.' },
    en: { subject: 'Your MediConnect supplier account is approved',
          title:   'Supplier account approved',
          greeting:`Hi ${businessName},`,
          body:    'Your account has been officially approved as a verified supplier. You can now add products, reply to RFQs, and use all features of your plan.',
          cta:     'Go to dashboard',
          footer:  'To upgrade your plan, contact our team.' },
  }[locale];

  const dashUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://mediconnect.dz'}/${locale === 'ar' ? '' : locale}/dashboard/supplier`;
  const body = `
    <p style="margin:0 0 12px;font-size:17px;font-weight:700;">${s.greeting}</p>
    <p style="margin:0 0 20px;">${s.body}</p>
    <p style="margin:24px 0;">
      <a href="${dashUrl}" style="display:inline-block;background:#15b886;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:700;font-size:15px;">${s.cta}</a>
    </p>
    <p style="margin:0;color:#64748b;font-size:13px;">${s.footer}</p>
  `;

  return { to, subject: s.subject, html: baseWrap(locale, s.title, body),
           text: `${s.greeting}\n\n${s.body}\n\n${s.cta}: ${dashUrl}\n\n${s.footer}` };
}

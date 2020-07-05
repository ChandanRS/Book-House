import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51H0pIrHcOSZZbxrm1JtxvShHkCv6KIBQ1s2MqKBCLFiYHX97oIkyErVfaUmHH4N2x55mdGYgXrNkpUlT5bI07KnQ001wU4PPAQ');

export const buyBook = async bookId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${bookId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

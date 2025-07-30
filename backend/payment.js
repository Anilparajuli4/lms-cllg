app.get('/payment-success', async (req, res) => {
  const { pidx, status, transaction_id } = req.query;

  // Always perform a lookup after the payment to verify
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key c751831329d544e18671b93070216342`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Process based on the lookup result
    const paymentStatus = response.data.status;
    if (paymentStatus === 'Completed') {
      // Payment successful
      res.redirect('/order-success');  // Redirect to a success page
    } else {
      // Payment not completed (pending, failed, etc.)
      res.redirect('/order-failed');   // Handle accordingly
    }
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});


app.post('/khalti-api/', async (req, res) => {
  try {
    const payload = req.body;
    const khaltiResponse = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', payload, {
      headers: {
        Authorization: `key c751831329d544e18671b93070216342`
      }
    });
    // Log the Khalti response data

    res.status(200).json({
      success: true,
      data: khaltiResponse.data
    });
  } catch (error) {
    console.error("Error during Khalti payment initiation:", error.message);  // Log any error that occurs
    res.status(500).json({
      success: false,
      message: "Payment initiation failed. Please try again."
    });
  }
});
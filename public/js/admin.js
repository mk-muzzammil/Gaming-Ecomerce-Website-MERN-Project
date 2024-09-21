const postDeleteAsync = (btn) => {
  const productId = btn.parentElement.querySelector(
    'input[name="productId"]'
  ).value;
  const csrfToken = btn.parentElement.querySelector(
    'input[name="_csrf"]'
  ).value;

  const productEle = btn.closest("article");
  fetch("/admin/product/" + productId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      productEle.parentNode.removeChild(productEle);
    })
    .catch((err) => {
      console.log(err);
    });
};

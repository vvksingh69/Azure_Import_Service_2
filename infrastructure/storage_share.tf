resource "azurerm_storage_share" "import_service_fa_share" {
  name                 = "funcimportsvcshare"
  storage_account_name = azurerm_storage_account.import_service_sa.name
  quota                = 5120  # 5GB, free tier compliant
}

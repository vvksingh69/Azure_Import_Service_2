resource "azurerm_storage_container" "uploaded" {
  name                  = "uploaded"
  storage_account_name  = azurerm_storage_account.import_service_sa.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "parsed" {
  name                  = "parsed"
  storage_account_name  = azurerm_storage_account.import_service_sa.name
  container_access_type = "private"
}
resource "azurerm_storage_account" "import_service_sa" {
  name                             = "importservicevs001"
  resource_group_name              = azurerm_resource_group.import_service_rg.name
  location                         = azurerm_resource_group.import_service_rg.location
  account_tier                     = "Standard"
  account_replication_type         = "LRS" /*  GRS, RAGRS, ZRS, GZRS, RAGZRS */
  access_tier                      = "Cool"
  enable_https_traffic_only        = true
  allow_nested_items_to_be_public  = true
  shared_access_key_enabled        = true
  public_network_access_enabled    = true
}
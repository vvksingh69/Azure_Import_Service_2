resource "azurerm_application_insights" "import_service_ai" {
  name                 = "appins-import-service-sand-ne-001"
  application_type     = "web"
  location             = "northeurope"
  resource_group_name  = azurerm_resource_group.import_service_rg.name
}

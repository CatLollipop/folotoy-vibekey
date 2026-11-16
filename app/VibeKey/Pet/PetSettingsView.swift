import SwiftUI

/// 所有宠物选择与设置都在同一个离线暗色画布中；设备事务仍由上层注入。
struct PetSettingsView: View {
    @Bindable var controller: PetController
    var canvasHeight:CGFloat = 600
    var onSyncPet: (@MainActor () async -> Void)? = nil
    var canSyncPet = true
    var syncingPet = false
    var petSyncStatus: String? = nil

    var body: some View {
        PetVisualSelector(controller: controller, canvasHeight:canvasHeight, onSyncPet: onSyncPet,
                          canSyncPet: canSyncPet, syncingPet: syncingPet, petSyncStatus: petSyncStatus)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .padding(.top, 20)
            .task { await controller.loadCatalog() }
    }
}

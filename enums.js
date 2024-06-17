const ChoreoRepository = {
    CHOREO_MANAGE: "ChoreoManaged",
    USER_MANAGE: "UserManagedEmpty",
    USER_MANAGE_NON_EMPTY: "UserManagedNonEmpty",
    USER_MANAGE_BUILDPACKS: "UserManagedBuildpacks"
}

const ChoreoBasicTemplates = ["service", "main", "webhook"]

module.exports = {
    ChoreoRepository: ChoreoRepository,
    ChoreoBasicTemplates: ChoreoBasicTemplates
}
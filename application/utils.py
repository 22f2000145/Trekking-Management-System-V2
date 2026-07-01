def roles_list():
    role_list = []
    for role in roles:
        role_list.append(role.name)
    return role_list
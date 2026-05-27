const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API para gestionar tareas',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la tarea'
            },
            title: {
              type: 'string',
              description: 'Título de la tarea'
            },
            description: {
              type: 'string',
              description: 'Descripción de la tarea'
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completación',
              default: false
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          },
          required: ['title']
        },
        TaskInput: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Título de la tarea'
            },
            description: {
              type: 'string',
              description: 'Descripción de la tarea'
            }
          },
          required: ['title']
        },
        TaskUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Título de la tarea'
            },
            description: {
              type: 'string',
              description: 'Descripción de la tarea'
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completación'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            lastname: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            email: {
              type: 'string',
              description: 'Email del usuario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'Token JWT de autenticación'
            }
          }
        },
        RegisterInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            lastname: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            email: {
              type: 'string',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario'
            }
          },
          required: ['name', 'lastname', 'email', 'password']
        },
        LoginInput: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario'
            }
          },
          required: ['email', 'password']
        }
      }
    },
    paths: {
      '/task': {
        get: {
          summary: 'Listar todas las tareas',
          tags: ['Tasks'],
          responses: {
            '200': {
              description: 'Lista de tareas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Task'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Crear una nueva tarea',
          tags: ['Tasks'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskInput'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Tarea creada',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task'
                  }
                }
              }
            }
          }
        }
      },
      '/task/{id}': {
        get: {
          summary: 'Obtener una tarea por ID',
          tags: ['Tasks'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid'
              },
              description: 'ID de la tarea'
            }
          ],
          responses: {
            '200': {
              description: 'Tarea encontrada',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task'
                  }
                }
              }
            },
            '404': {
              description: 'Tarea no encontrada'
            }
          }
        },
        put: {
          summary: 'Actualizar una tarea',
          tags: ['Tasks'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid'
              },
              description: 'ID de la tarea'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TaskUpdate'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Tarea actualizada',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Task'
                  }
                }
              }
            },
            '404': {
              description: 'Tarea no encontrada'
            }
          }
        },
        delete: {
          summary: 'Eliminar una tarea',
          tags: ['Tasks'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid'
              },
              description: 'ID de la tarea'
            }
          ],
          responses: {
            '204': {
              description: 'Tarea eliminada'
            },
            '404': {
              description: 'Tarea no encontrada'
            }
          }
        }
      },
      '/auth/register': {
        post: {
          summary: 'Registrar un nuevo usuario',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterInput'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Usuario registrado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Error de validación o email ya registrado'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginInput'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login exitoso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Credenciales inválidas'
            }
          }
        }
      }
    }
  },
  apis: []
};

export default swaggerOptions;
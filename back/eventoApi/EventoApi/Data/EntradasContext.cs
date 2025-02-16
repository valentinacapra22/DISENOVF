using System;
using System.Collections.Generic;
using EventoApi.Models;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace EventoApi.Data;

public partial class EntradasContext : DbContext
{
    public EntradasContext()
    {
    }

    public EntradasContext(DbContextOptions<EntradasContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Ciudad> Ciudads { get; set; }

    public virtual DbSet<Evento> Eventos { get; set; }

    public virtual DbSet<Lugar> Lugars { get; set; }

    public virtual DbSet<Provincia> Provincia { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=127.0.0.1;port=3306;database=entradas;user=root", ServerVersion.Parse("10.4.32-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.HasKey(e => e.ID).HasName("PRIMARY");

            entity.ToTable("ciudad");

            entity.HasIndex(e => e.ProvinciaId, "fk_provinciaID");

            entity.Property(e => e.ID)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.Nombre).HasMaxLength(45);
            entity.Property(e => e.ProvinciaId)
                .HasColumnType("int(11)")
                .HasColumnName("provinciaID");

            entity.HasOne(d => d.ProvinciaIDNavegation).WithMany(p => p.Ciudads)
                .HasForeignKey(d => d.ProvinciaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_provinciaID");
        });

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.HasKey(e => e.ID).HasName("PRIMARY");

            entity.ToTable("evento");

            entity.HasIndex(e => e.LugarId, "fk_lugarID");

            entity.Property(e => e.ID)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.Descripcion).HasMaxLength(45);
            entity.Property(e => e.Fecha).HasMaxLength(45);
            entity.Property(e => e.HorarioFin).HasMaxLength(45);
            entity.Property(e => e.HorarioInicio).HasMaxLength(45);
            entity.Property(e => e.LugarId)
                .HasColumnType("int(11)")
                .HasColumnName("lugarID");
            entity.Property(e => e.Nombre).HasMaxLength(45);

            entity.HasOne(d => d.LugarIDNavegation).WithMany(p => p.Eventos)
                .HasForeignKey(d => d.LugarId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_lugarID");
        });

        modelBuilder.Entity<Lugar>(entity =>
        {
            entity.HasKey(e => e.ID).HasName("PRIMARY");

            entity.ToTable("lugar");

            entity.HasIndex(e => e.CiudadId, "fk_ciudadID_idx");

            entity.Property(e => e.ID)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.CiudadId)
                .HasColumnType("int(11)")
                .HasColumnName("ciudadID");
            entity.Property(e => e.Descripcion).HasMaxLength(45);

            entity.HasOne(d => d.CiudadIDNavegation).WithMany(p => p.Lugars)
                .HasForeignKey(d => d.CiudadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_ciudadID");
        });

        modelBuilder.Entity<Provincia>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("provincia");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.Nombre).HasMaxLength(45);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
